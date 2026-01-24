package com.example.smartmoneytracking.infrastructure.persistence.repositories;

import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import com.example.smartmoneytracking.infrastructure.persistence.jpa.repositories.UserJpaRepository;
import com.example.smartmoneytracking.infrastructure.persistence.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository userJpaRepository;
    private final UserMapper userMapper;

    @Override
    public User save(User user) {
        var jpaEntity = userMapper.toJpaEntity(user);
        var savedEntity = userJpaRepository.save(jpaEntity);
        return userMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findByPhone(String phone) {
        return userJpaRepository.findByPhone(phone)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id)
                .map(userMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }

    @Override
    public void delete(User user) {
        var jpaEntity = userMapper.toJpaEntity(user);
        userJpaRepository.delete(jpaEntity);
    }
}
