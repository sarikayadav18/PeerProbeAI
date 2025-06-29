package com.PeerProbeAI.server.repository;

import com.PeerProbeAI.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Basic query methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    // Custom query for updating rating
    @Modifying
    @Query("UPDATE User u SET u.rating = :rating WHERE u.id = :userId")
    void updateUserRating(@Param("userId") Long userId, @Param("rating") Double rating);

    // Custom query for finding users by rating range
    @Query("SELECT u FROM User u WHERE u.rating BETWEEN :min AND :max")
    List<User> findByRatingBetween(@Param("min") Double minRating, @Param("max") Double maxRating);
}