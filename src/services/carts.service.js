const Order = require('../models/Order');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const CART_STATUS = 'reserved';
const SHIPPING_COST = 50;

const saveProductInCart = async(userId, productForCart, branchId) => {
    try {
        let existingCart = await Order.findOne({customer: userId, statusOrder: CART_STATUS})
        let result
        if(existingCart){
            if(existingCart.branch != branchId){
                throw {
                    status: 400,
                    message: "No se puede agregar el producto debido a que el carrito no pertence a esa sucursal."
                }
            }

            const existingProduct = existingCart.orderProducts.find((element) => element.product.toString() === productForCart._id.toString())
            if(existingProduct){
                let productDemand = Number(existingProduct.quantity)+Number(productForCart.quantity)
                let stockAvailabie = await isStockAvailable({productId:productForCart._id, quantity: productDemand, branchId: branchId})
                if(!stockAvailabie.hasStock){
                    throw {
                        status: 400,
                        message: `No se puede agregar el producto debido a que se alcanzó el limite: ${stockAvailabie.maxStock}.`
                    }
                }                 
                 existingProduct.quantity += Number(productForCart.quantity);
                 existingProduct.price += Number(productForCart.price);
                 existingCart.totalPrice += Number(productForCart.price);
                 result = await existingCart.save();
            }else{
                let stockAvailabie = await isStockAvailable({productId:productForCart._id, quantity: productForCart.quantity, branchId: branchId})
                if(!stockAvailabie.hasStock){
                    throw {
                        status: 400,
                        message: `No se puede agregar el producto debido a que se alcanzó el limite: ${stockAvailabie.maxStock}.`
                    }
                } 
                existingCart.orderProducts.push({
                    product: productForCart._id,
                    quantity: Number(productForCart.quantity),
                    price: Number(productForCart.price)
                });            
                existingCart.totalPrice += productForCart.price;
                result = await existingCart.save();
            }            
            
        }else{
            let stockAvailabie = await isStockAvailable({productId:productForCart._id, quantity: productForCart.quantity, branchId: branchId})
            if(!stockAvailabie.hasStock){
                throw {
                    status: 400,
                    message: `No se puede agregar el producto debido a que se alcanzó el limite: ${stockAvailabie.maxStock}.`
                }
            } 
           let newCart = new Order({
                orderNumber: generateOrderNumber(userId),
                totalPrice: Number(productForCart.price),
                branch: branchId,
                orderProducts :[{
                    product: productForCart._id,
                    quantity: Number(productForCart.quantity),
                    price: Number(productForCart.price)
                }],                
                customer: userId,
                statusOrder: CART_STATUS
           })
           result = await newCart.save()
        }
        return result
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}


function generateOrderNumber(id) {
    const fecha = new Date();
    const fechaFormato = 
        fecha.getFullYear().toString() + 
        (fecha.getMonth() + 1).toString().padStart(2, '0') + 
        fecha.getDate().toString().padStart(2, '0') +
        fecha.getHours().toString().padStart(2, '0') +
        fecha.getMinutes().toString().padStart(2, '0') +
        fecha.getSeconds().toString().padStart(2, '0');
    const numericId = id.substring(1,6).replace(/\D/g, ''); 
    const orderNumber = Number(`${fechaFormato}${numericId}`);
    
    return orderNumber;
}





const getCart = async (userId, status) => {
    try {
        if (status !== undefined && status === CART_STATUS) {

            const cartOrder = await Order.findOne({ customer: userId, statusOrder: status })
            .populate([
                { path: 'orderProducts.product' },
                { path: 'branch', 
                    select: 'address'
                },
                {
                    path: 'customer',
                    select: 'client.addresses'
                }
            ]);            

            return cartOrder;
        }
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

const deleteCart = async (orderId, status) => {
    try {
        if (status !== undefined && status === CART_STATUS) {
            await Order.deleteOne({ _id: orderId, statusOrder: status });

            return;
        }
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

const updateCartQuantities = async (orderId, status, newCartInfo) => {
    try {
        if (status !== undefined && status === CART_STATUS) {
            const { productId, quantity } = newCartInfo;
            const cartOrder = await Order.findOne({ _id: orderId, statusOrder: status })
                .populate({
                    path: 'orderProducts.product',
                });
            
            if (cartOrder.orderProducts.length > 0) {
                const productIndex = cartOrder.orderProducts.findIndex(
                    product => product.product._id.toString() === productId.toString()
                );
                                
                if (productIndex >= 0) {
                    if (quantity > 0) {
                        const stockResult = await isStockAvailable(newCartInfo);
                        const currentProduct = cartOrder.orderProducts[productIndex].product;
                        
                        if (stockResult.maxStock === 0) {
                            cartOrder.orderProducts.splice(productIndex, 1);
                        } else if (stockResult.hasStock) {
                            if (quantity <= currentProduct.limit) {
                                cartOrder.orderProducts[productIndex].quantity = quantity;
                            } else {
                                cartOrder.orderProducts[productIndex].quantity = currentProduct.limit;
                                stockResult.hasStock = false;
                            }
                        } else {
                            cartOrder.orderProducts[productIndex].quantity = stockResult.maxStock;
                        }
                        
                        await cartOrder.save();

                        if (cartOrder.orderProducts.length === 0) {
                            await cartOrder.deleteOne();
                            return { cart: "Carrito eliminado" };
                        }

                        const updatedCart = await Order.findById(cartOrder._id)
                            .populate({
                                path: 'orderProducts.product',
                            });
                        
                        return {cart: updatedCart, maxStock: stockResult.maxStock, hasStock: stockResult.hasStock};
                    }
                }
            }             
        }
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

const getMainCartDetails = async (userId, status) => {
    try {
        if (status === undefined && status !== CART_STATUS) {
            throw {
                status: 400,
                message: "El estado de la orden no pertenece a un carrito"
            };
        }

        const cart = await Order.findOne({ 
            customer: userId,
            statusOrder: status
        })
        .populate([
            {
                path: 'branch',
                select: 'address'
            },
            {
                path: 'customer',
                select: 'client.addresses'
            }
        ]);

        if (!cart) {
            throw {
                status: 404,
                message: "Carrito no encontrado o no pertenece al usuario"
            };
        }

        let finalPrice = 0.00;

        cart.orderProducts.forEach(element => {
            let productPrice = element.quantity * element.price;
            finalPrice = finalPrice + productPrice;
        });

        finalPrice += SHIPPING_COST;

        return {
            totalPrice: finalPrice,
            orderId: cart._id,
            branchId: cart.branch,
            branchAddress: cart.branch.address,
            clientAddresses: cart.customer.client.addresses
        }
            
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

async function isStockAvailable(newCartInfo) {
    try {
        const { productId, quantity, branchId } = newCartInfo;
    
        const branch = await Branch.findOne(
            { 
                _id: branchId,
                'branchProducts.product': productId 
            },
            { 
                'branchProducts.$': 1 
            }
        );

        if (!branch || !branch.branchProducts.length) {
            throw {
                status: 400,
                message: "Producto no encontrado en la sucursal"
            }
        }

        const availableQuantity = branch.branchProducts[0].quantity;

        if (quantity > availableQuantity) {
            return {
                hasStock: false,
                maxStock: availableQuantity
            };
        }

        return {
            hasStock: true,
            maxStock: availableQuantity
        };
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }   
}

module.exports = { 
    getCart,
    deleteCart,
    updateCartQuantities,
    getMainCartDetails,
    saveProductInCart
}