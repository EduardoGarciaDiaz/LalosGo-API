const ProductSchema = require('../models/Product')


const UploadProductImage = async (call, callback)  => {
    const {productId, imageData } = call.request;

    if (!productId || !imageData) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Faltan datos requeridos: 'productId' o 'imageData'.",
        });
    }

    try {
        let productToEdit = await ProductSchema.findByIdAndUpdate(
            productId, 
            {
                $set:{
                    image: imageData
                }
            },
            { new: true, useFindAndModify: false }
        )
        callback(null, { 
            message: "Imagen guardada exitosamente", 
            productId: productToEdit._id.toString() 
        });
    } catch (error) {
        console.error("Error al guardar la imagen:", error);
        callback({
            code: grpc.status.INTERNAL,
            details: "Error al guardar la imagen",
        });
    }
}

module.exports = {
    UploadProductImage
}