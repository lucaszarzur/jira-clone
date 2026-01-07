package com.jiraclone.service;

import com.jiraclone.domain.entity.User;
import com.jiraclone.domain.enums.UserRole;
import com.jiraclone.domain.repository.UserRepository;
import com.jiraclone.dto.request.RegisterRequest;
import com.jiraclone.dto.response.UserResponse;
import com.jiraclone.exception.BadRequestException;
import com.jiraclone.exception.ForbiddenException;
import com.jiraclone.exception.ResourceNotFoundException;
import com.jiraclone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse createUser(RegisterRequest request, UserPrincipal currentUser) {
        // Only admins can create users
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Apenas administradores podem criar usuários");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email já está em uso");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(UserRole.USER)
            .build();

        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(String id, RegisterRequest request, UserPrincipal currentUser) {
        // Only admins can update users
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Apenas administradores podem atualizar usuários");
        }

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Check if email is being changed and if it's already in use
        if (!user.getEmail().equals(request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email já está em uso");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional
    public void deleteUser(String id, UserPrincipal currentUser) {
        // Only admins can delete users
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Apenas administradores podem deletar usuários");
        }

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userRepository.delete(user);
    }
}
