package com.example.smartmoneytracking.infrastructure.security;

import com.example.smartmoneytracking.domain.entities.user.exceptions.UserNotFoundException;
import com.example.smartmoneytracking.domain.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


// UserDetailsService = service dùng để TÌM USER khi login
// nói đơn giản: UserDetailsService = “làm sao để tìm ra UserPrincipal từ DB?”
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UserNotFoundException {
        return userRepository.findByUsername(username)
                .map(UserPrincipal::new) // = .map(user -> new UserPrincipal(user))
                .orElseThrow(()->new UsernameNotFoundException("User not found " + username));
    }
}