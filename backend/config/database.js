import mongoose from 'mongoose';import mongoose from 'mongoose';



const connectDB = async () => {const connectDB = async () => {

  try {  try {

    const conn = await mongoose.connect(process.env.MONGODB_URI, {    const conn = await mongoose.connect(process.env.MONGODB_URI, {

      useNewUrlParser: true,      useNewUrlParser: true,

      useUnifiedTopology: true,      useUnifiedTopology: true,

    });    });



    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);

        

    // Handle connection events    // Handle connection events

    mongoose.connection.on('error', (err) => {    mongoose.connection.on('error', (err) => {

      console.error('❌ MongoDB connection error:', err);      console.error('❌ MongoDB connection error:', err);

    });    });



    mongoose.connection.on('disconnected', () => {    mongoose.connection.on('disconnected', () => {

      console.log('🔌 MongoDB disconnected');      console.log('🔌 MongoDB disconnected');

    });    });



    // Handle application termination    // Handle application termination

    process.on('SIGINT', async () => {    process.on('SIGINT', async () => {

      await mongoose.connection.close();      await mongoose.connection.close();

      console.log('📴 MongoDB connection closed due to application termination');      console.log('📴 MongoDB connection closed due to application termination');

      process.exit(0);      process.exit(0);

    });    });



  } catch (error) {  } catch (error) {

    console.error('❌ Error connecting to MongoDB:', error.message);    console.error('❌ Error connecting to MongoDB:', error.message);

    process.exit(1);    process.exit(1);

  }  }

};};



export default connectDB;export default connectDB;