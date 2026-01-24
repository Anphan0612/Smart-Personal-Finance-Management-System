package com.example.smartmoneytracking.domain.entities.user.exceptions;

public class UserNotFoundException extends RuntimeException
{
    public UserNotFoundException(String message)
    {
        super(message);
    }
}
