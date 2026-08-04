package com.attendance.auth.security;

import com.attendance.auth.model.AuthUser;
import com.attendance.auth.model.UserStatus;
import com.attendance.auth.repository.AuthUserRepository;
import com.attendance.auth.util.EmailNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MongoUserDetailsService implements UserDetailsService {

    private final AuthUserRepository authUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        String normalizedEmail= EmailNormalizer.normalize(email);
        AuthUser user= authUserRepository.findByEmail(normalizedEmail).orElseThrow(()->
                new UsernameNotFoundException("Invalid email or Password"));

        String[] authorities=user.getRoles().stream().map(role->"ROLE_" + role.name()).toArray(String[]::new);

        return User.withUsername(user.getEmail()).password(user.getPasswordHash())
                .authorities(authorities).disabled(user.getStatus()== UserStatus.DISABLED)
                .accountLocked(user.getStatus()==UserStatus.LOCKED).build();
    }
}
