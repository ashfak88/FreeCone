import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();
console.log(
  "Callback URL:",
  `${process.env.BASE_URL}/api/auth/google/callback`
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "https://freecone.duckdns.org/api/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          if (user.status === "blocked") {
            return done(null, false, { message: "Account suspended" })
          }
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails?.[0].value })

        if (user) {
          if (user.status === "blocked") {
            return done(null, false, { message: "Account suspended" });
          }
          user.googleId = profile.id
          await user.save();
          return done(null, user);
        }

        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0].value,
          googleId: profile.id,
          role: "user",
        });

        await user.save()
        done(null, user)
      } catch (err: any) {
        done(err, undefined)
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id)
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await User.findById(id)
    if (user && user.status === "blocked") {
      return done(null, false);
    }
    done(null, user);
  } catch (err: any) {
    done(err, null);
  }
});

export default passport;
