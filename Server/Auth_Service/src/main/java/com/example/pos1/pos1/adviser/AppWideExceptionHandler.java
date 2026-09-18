//package com.example.pos1.pos1.adviser;
//
//import com.example.pos1.pos1.exception.BadRequestException;
//import com.example.pos1.pos1.exception.DuplicateEntryException;
//import com.example.pos1.pos1.exception.EntryNotFoundException;
//import com.example.pos1.pos1.exception.UnauthorizedException;
//import com.example.pos1.pos1.util.StandardResponseDto;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@RestControllerAdvice
//public class AppWideExceptionHandler {
//
//    @ExceptionHandler(EntryNotFoundException.class)
//    public ResponseEntity<StandardResponseDto> handleEntryNotFoundException(EntryNotFoundException e) {
//        return new ResponseEntity<>(
//                new StandardResponseDto(404,e.getMessage(),e),
//                HttpStatus.NOT_FOUND
//        );
//    }
//
//    @ExceptionHandler(DuplicateEntryException.class)
//    public ResponseEntity<StandardResponseDto> handleDuplicateEntryException(DuplicateEntryException e){
//        return new ResponseEntity<>(
//                new StandardResponseDto(409,e.getMessage(),e),
//                HttpStatus.CONFLICT
//        );
//    }
//
//    @ExceptionHandler(BadRequestException.class)
//    public ResponseEntity<StandardResponseDto> handleBadRequestException(BadRequestException e) {
//
//        return new ResponseEntity<StandardResponseDto>(
//                new StandardResponseDto( 400,e.getMessage(), e),
//                HttpStatus.BAD_REQUEST);
//    }
//
//
//    @ExceptionHandler(UnauthorizedException.class)
//    public ResponseEntity<StandardResponseDto> handleUnauthorizedException(UnauthorizedException e) {
//        return new ResponseEntity<StandardResponseDto>(
//                new StandardResponseDto( 401,e.getMessage(), e),
//                HttpStatus.UNAUTHORIZED);
//    }
//
//
//}
