import passport from "passport";
import bcrypt from "bcryptjs";

import User from "../models/user.models.js";
import { GraphQLLocalStrategy } from "graphql-passport";

export const configurePassPort = async ()=>{
    passport.serializeUser((user, done) => {
        console.log("serializing user")
        done(null, user.id);
    });


    passport.deserializeUser(async (id, done) => {
        console.log("deserializing user")
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    passport.use(
        new GraphQLLocalStrategy(async (username, password, done) => {
            try {
                const user = await User.findOne({ username: username });
                if (!user) {
                    throw new Error("Invalid username or password");
                }
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    throw new Error("Invalid username or password");
                } else {
                    return done(null, user);
                }
            } catch (err) {
                done(err);
            }
        })
    );
}