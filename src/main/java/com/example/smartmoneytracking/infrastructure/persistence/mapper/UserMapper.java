package com.example.smartmoneytracking.infrastructure.persistence.mapper;

import com.example.smartmoneytracking.domain.entities.user.User;
import com.example.smartmoneytracking.infrastructure.persistence.jpa.entities.UserJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert between domain User and JPA UserJpaEntity
 */
@Component
public class UserMapper {

    /**
     * Convert JPA entity to domain entity
     */
    public User toDomain(UserJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }

        User user = new User();
        user.setId(jpaEntity.getId());
        user.setName(jpaEntity.getName());
        user.setEmail(jpaEntity.getEmail());
        user.setPassword(jpaEntity.getPassword());
        user.setPhone(jpaEntity.getPhone());
        user.setEnabled(jpaEntity.isEnabled());
        user.setCreatedAt(jpaEntity.getCreatedAt());
        user.setUpdatedAt(jpaEntity.getUpdatedAt());
        return user;
    }

    /**
     * Convert domain entity to JPA entity
     */
    public UserJpaEntity toJpaEntity(User user) {
        if (user == null) {
            return null;
        }

        UserJpaEntity jpaEntity = new UserJpaEntity();
        jpaEntity.setId(user.getId());
        jpaEntity.setName(user.getName());
        jpaEntity.setEmail(user.getEmail());
        jpaEntity.setPassword(user.getPassword());
        jpaEntity.setPhone(user.getPhone());
        jpaEntity.setEnabled(user.isEnabled());
        jpaEntity.setCreatedAt(user.getCreatedAt());
        jpaEntity.setUpdatedAt(user.getUpdatedAt());
        return jpaEntity;
    }
}
