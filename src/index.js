const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const v1Router = require("./v1/routes")
const cors = require('cors');


const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const fs = require('fs')
const PROTO_PATH = "./src/images.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH)
const ImageProto = grpc.loadPackageDefinition(packageDefinition).ImageService
const Image_Service = require('./GRPC/ImagesService')



require('./database')

const PORT = process.env.SERVER_PORT || 3000
const GRPC_PORT = process.env.GRPC_PORT || 3001

app.use(cors());


app.use("/api/v1", v1Router)
app.use('*', (req, res) => { res.status(404).send()})

server = app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port:${PORT}/api/v1`)
})


const grpcServer = new grpc.Server()
grpcServer.addService(ImageProto.service,{UploadProductImage: Image_Service.UploadProductImage})
grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`GRPC listening on port:${GRPC_PORT}`)   
})

module.exports = {
    server,
    grpcServer
}