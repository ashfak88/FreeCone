import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          if (user.status === "blocked") {
            return done(null, false, { message: "Account suspended" });
          }
          return done(null, user);
        }

        // If not, check if user exists with the same email
        user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          if (user.status === "blocked") {
            return done(null, false, { message: "Account suspended" });
          }
          // Update user with googleId
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user if neither exists
        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0].value,
          googleId: profile.id,
          role: "user", // default role
        });

        await user.save();
        done(null, user);
      } catch (err: any) {
        done(err, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await User.findById(id);
    if (user && user.status === "blocked") {
      return done(null, false);
    }
    done(null, user);
  } catch (err: any) {
    done(err, null);
  }
});

export default passport;
