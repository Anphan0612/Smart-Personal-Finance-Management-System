package com.example.smartmoneytracking.domain.repositories;

import com.example.smartmoneytracking.domain.entities.user.User;

import java.util.Optional;

/**
 * Domain repository interface for User entity
 */
public interface UserRepository {

    User save(User user);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findById(String id);

    boolean existsByEmail(String email);

    void delete(User user);
}
