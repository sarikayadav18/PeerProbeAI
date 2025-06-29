package com.PeerProbeAI.server.security;

import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expirationMs}")
    private int jwtExpirationMs;

    private SecretKey getSigningKey() {
        logger.debug("Generating signing key from secret");
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        logger.debug("Signing key generated successfully");
        return key;
    }

    public String generateJwtToken(Authentication authentication) {
        logger.info("Starting JWT generation for authentication principal");
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String username = userPrincipal.getUsername();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        logger.debug("Username: {}", username);
        logger.debug("Issued at: {}", now);
        logger.debug("Expiration at: {}", expiryDate);

        String token = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();

        logger.info("JWT generated successfully");
        return token;
    }

    public String getUserNameFromJwtToken(String token) {
        logger.info("Extracting username from JWT token");
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            String subject = claims.getSubject();
            logger.debug("Username extracted: {}", subject);
            return subject;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT parsing error: {}", e.getMessage());
        }
        return null;
    }

    public boolean validateJwtToken(String authToken) {
        logger.info("Validating JWT token");
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            logger.info("JWT token is valid");
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT validation error: {}", e.getMessage());
        }
        return false;
    }
}
