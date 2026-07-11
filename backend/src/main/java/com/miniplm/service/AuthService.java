package com.miniplm.service;

import com.miniplm.dto.LoginRequestDto;
import com.miniplm.dto.LoginResponseDto;
import com.miniplm.dto.RegisterRequestDto;
import com.miniplm.dto.UserResponseDto;
import com.miniplm.exception.BadRequestException;
import com.miniplm.exception.ResourceNotFoundException;
import com.miniplm.model.Folder;
import com.miniplm.model.User;
import com.miniplm.repository.FolderRepository;
import com.miniplm.repository.UserRepository;
import com.miniplm.config.JwtUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final FolderRepository folderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, FolderRepository folderRepository,
                       PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.folderRepository = folderRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur connecté non trouvé en base"));
    }

    @Transactional
    public UserResponseDto registerUser(RegisterRequestDto registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Le nom d'utilisateur est déjà pris");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("L'adresse email est déjà utilisée");
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getRole()
        );

        user = userRepository.save(user);

        // Auto-create Home folder for the new user
        Folder homeFolder = new Folder("Home", null, user);
        folderRepository.save(homeFolder);

        return new UserResponseDto(user);
    }

    public LoginResponseDto authenticateUser(LoginRequestDto loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadRequestException("Identifiants incorrects"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Identifiants incorrects");
        }

        String jwt = jwtUtils.generateJwtToken(user.getUsername());
        return new LoginResponseDto(jwt, new UserResponseDto(user));
    }
}
