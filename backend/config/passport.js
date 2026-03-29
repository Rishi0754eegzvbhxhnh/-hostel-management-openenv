const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); }
  catch (err) { done(err, null); }
});

// ─── Google Strategy (only if configured) ────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) { user.googleId = profile.id; await user.save(); return done(null, user); }
      user = new User({
        fullName: profile.displayName, email: profile.emails[0].value,
        googleId: profile.id, collegeId: `GOOGLE-${profile.id}`,
        phone: '0000000000', password: `oauth_${Math.random().toString(36).slice(-8)}`,
      });
      await user.save();
      return done(null, user);
    } catch (err) { return done(err, null); }
  }));
  console.log('✅ Google OAuth strategy loaded');
} else {
  console.log('⚠️  Google OAuth not configured (set GOOGLE_CLIENT_ID in .env)');
}

// ─── GitHub Strategy (only if configured) ────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id') {
  const GitHubStrategy = require('passport-github2').Strategy;
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
    scope: ['user:email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (user) return done(null, user);
      const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
      user = await User.findOne({ email });
      if (user) { user.githubId = profile.id; await user.save(); return done(null, user); }
      user = new User({
        fullName: profile.displayName || profile.username, email,
        githubId: profile.id, collegeId: `GITHUB-${profile.id}`,
        phone: '0000000000', password: `oauth_${Math.random().toString(36).slice(-8)}`,
      });
      await user.save();
      return done(null, user);
    } catch (err) { return done(err, null); }
  }));
  console.log('✅ GitHub OAuth strategy loaded');
} else {
  console.log('⚠️  GitHub OAuth not configured (set GITHUB_CLIENT_ID in .env)');
}

module.exports = passport;
