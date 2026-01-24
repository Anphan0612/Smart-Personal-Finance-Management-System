package com.example.smartmoneytracking.infrastructure.persistence.jpa.repositories;

import com.example.smartmoneytracking.infrastructure.persistence.jpa.entities.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {

    Optional<UserJpaEntity> findByEmail(String email);

    Optional<UserJpaEntity> findByPhone(String phone);

    boolean existsByEmail(String email);
}
