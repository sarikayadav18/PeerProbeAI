package com.PeerProbeAI.server.security;

import io.jsonwebtoken.*;
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

    // Generate signing key from secret
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generates a JWT token from authentication object
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("userId", userPrincipal.getId())
                .claim("email", userPrincipal.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Extracts username from JWT token
     */
    public String getUserNameFromJwtToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extracts user ID from JWT token
     */
    public Integer getUserIdFromJwtToken(String token) {
        return parseClaims(token).get("userId", Integer.class);
    }

    /**
     * Extracts email from JWT token
     */
    public String getEmailFromJwtToken(String token) {
        return parseClaims(token).get("email", String.class);
    }

    /**
     * Validates JWT token
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Parses JWT claims
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Gets complete user details from token
     */
    public UserDetails getUserDetailsFromToken(String token) {
        Claims claims = parseClaims(token);
        return new UserDetails(
                claims.getSubject(),
                claims.get("userId", Integer.class),
                claims.get("email", String.class)
        );
    }

    /**
     * Gets token expiration date
     */
    public Date getExpirationDateFromToken(String token) {
        return parseClaims(token).getExpiration();
    }

    /**
     * Checks if token is expired
     */
    public boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * Generates a token from user details (for non-authentication scenarios)
     */
    public String generateTokenFromUserDetails(UserDetailsImpl userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("userId", userDetails.getId())
                .claim("email", userDetails.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Inner class for user details transport
     */
    public static class UserDetails {
        private final String username;
        private final Integer userId;
        private final String email;

        public UserDetails(String username, Integer userId, String email) {
            this.username = username;
            this.userId = userId;
            this.email = email;
        }

        public String getUsername() { return username; }
        public Integer getUserId() { return userId; }
        public String getEmail() { return email; }
    }
}