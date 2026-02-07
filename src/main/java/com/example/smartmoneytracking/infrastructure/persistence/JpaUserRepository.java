package com.example.smartmoneytracking.infrastructure.persistence;

import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaUserRepository extends JpaRepository<User, String>, UserRepository {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    // findById and save are inherited from JpaRepository
}
