import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { Application } from 'express';
import { getDatabase } from './database';
import { logger } from './logger';

export function initializePassport(app: Application): void {
  app.use(passport.initialize());

  const prisma = getDatabase();

  // Local Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { oauthProviders: true }
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Please use OAuth to sign in' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is deactivated' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return done(null, user);
      } catch (error) {
        logger.error('Local strategy error:', error);
        return done(error);
      }
    }
  ));

  // JWT Strategy
  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env['JWT_SECRET'],
      ignoreExpiration: false
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            bio: true,
            skills: true,
            socialLinks: true,
            karmaScore: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!user || !user.isActive) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        logger.error('JWT strategy error:', error);
        return done(error, false);
      }
    }
  ));

  // Google OAuth Strategy
  if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
    logger.info('Configuring Google OAuth strategy');
    passport.use(new GoogleStrategy(
      {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: `${process.env['SERVER_URL'] || 'http://localhost:5000'}/api/auth/google/callback`
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user exists with this Google ID
          let oauthProvider = await prisma.oAuthProvider.findUnique({
            where: {
              provider_providerId: {
                provider: 'google',
                providerId: profile.id
              }
            },
            include: { user: true }
          });

          if (oauthProvider) {
            // Update last login
            await prisma.user.update({
              where: { id: oauthProvider.user.id },
              data: { lastLoginAt: new Date() }
            });
            return done(null, oauthProvider.user);
          }

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'));
          }

          let user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
          });

          if (user) {
            // Link Google account to existing user
            await prisma.oAuthProvider.create({
              data: {
                provider: 'google',
                providerId: profile.id,
                userId: user.id
              }
            });
          } else {
            // Create new user
            const username = await generateUniqueUsername(profile.displayName || email.split('@')[0]);
            
            user = await prisma.user.create({
              data: {
                email: email.toLowerCase(),
                username,
                avatar: profile.photos?.[0]?.value,
                emailVerified: true,
                lastLoginAt: new Date(),
                oauthProviders: {
                  create: {
                    provider: 'google',
                    providerId: profile.id
                  }
                }
              }
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error);
        }
      }
    ));
    logger.info('✅ Google OAuth strategy registered');
  } else {
    logger.warn('Google OAuth env not set: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing. Skipping Google strategy.');
  }


  logger.info('✅ Passport strategies initialized');
}

async function generateUniqueUsername(baseUsername: string): Promise<string> {
  const prisma = getDatabase();
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
  let counter = 0;
  
  while (true) {
    const testUsername = counter === 0 ? username : `${username}${counter}`;
    const existingUser = await prisma.user.findUnique({
      where: { username: testUsername }
    });
    
    if (!existingUser) {
      return testUsername;
    }
    counter++;
  }
}
