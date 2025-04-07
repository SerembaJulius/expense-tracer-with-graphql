import Transaction from "../models/transaction.model.js";
import User from "../models/user.models.js"

const transactionResolver ={
    Query: {
        transaction:async (_,__,context)=>{
            try{
                if(!context.user){
                    throw new Error("Unauthenticated");
                }
                const userId = await context.getUserId();
                const transaction = await Transaction.find({userId});
                return transaction;
            }catch(err){
                console.error("Error getting transaction:", err)
                throw new Error(err.message || "Error getting transaction");
            }
        },
        transaction: async (_,{transactionId})=>{
            try{

                const transaction = await Transaction.findById(transactionId);
                return transaction;

            }catch(err){
                console.error("Error getting transaction:", err)
                throw new Error(err.message || "Error getting transaction");
            }
        },
        //category statistics for the chart
        categoryStatistics: async (_,__,context)=>{
            if(!context.getUser()) throw new Error("Unauthorised")

            const userId = context.getUser()._id;
            const transaction = await Transaction.find({userId});
            const categoryMap = {};

            transaction.forEach((transaction)=>{
                if(!categoryMap[transaction.category]){
                    categoryMap[transaction.category] =0;
                }
                categoryMap[transaction.category]+= transaction.amount;
            })
            return Object.entries(categoryMap).map(([category, totalAmount])=>({category,totalAmount}))
        }
    },
    Mutation: {
        createTransaction: async(_,{input},context)=>{
            try{
        
                const transaction = await Transaction.create({...input,userId:context.getUser()._id});
                await newTransaction.save();
                return transaction;
            }catch(err){
                console.error("Error creating transaction:", err)
                throw new Error(err.message || "Error creating transaction");
            }
        },
        updateTransaction:async(_,{input})=>{
            try{
                const updatedTransaction = await Transaction.findByIdAndUpdate(input.transactionId,input,{new:true});
                return updatedTransaction;
            }catch(err){
                console.error("Error updating transaction:", err)
                throw new Error(err.message || "Error updating transaction");
            }
        },
        deleteTransaction:async(_,{transactionId})=>{
            try{
                const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
                return deletedTransaction;
            }catch(err){
                console.error("Error deleting transaction:", err)
                throw new Error(err.message || "Error deleting transaction");
            }
        }
    },

    Transaction: {
		user: async (parent) => {
			const userId = parent.userId;
			try {
				const user = await User.findById(userId);
				return user;
			} catch (err) {
				console.error("Error getting user:", err);
				throw new Error("Error getting user");
			}
		},
	},
};


export default transactionResolver;