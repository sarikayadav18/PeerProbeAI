//package com.PeerProbeAI.server.exception;
//
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ControllerAdvice;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
//
//@ControllerAdvice
//public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
//
//    @ExceptionHandler(RoomNotFoundException.class)
//    public ResponseEntity<ErrorResponse> handleRoomNotFound(RoomNotFoundException ex) {
//        ErrorResponse response = new ErrorResponse(
//                HttpStatus.NOT_FOUND.value(),
//                "Room not found",
//                ex.getMessage()
//        );
//        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
//    }
//
//    @ExceptionHandler(DocumentAccessException.class)
//    public ResponseEntity<ErrorResponse> handleDocumentAccess(DocumentAccessException ex) {
//        ErrorResponse response = new ErrorResponse(
//                HttpStatus.FORBIDDEN.value(),
//                "Document access denied",
//                ex.getMessage()
//        );
//        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
//    }
//
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
//        ErrorResponse response = new ErrorResponse(
//                HttpStatus.INTERNAL_SERVER_ERROR.value(),
//                "Internal server error",
//                ex.getMessage()
//        );
//        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
//    }
//}