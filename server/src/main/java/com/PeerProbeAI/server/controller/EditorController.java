//package com.PeerProbeAI.server.controller;
//
//import com.PeerProbeAI.server.dto.OperationDto;
//import com.PeerProbeAI.server.service.CollaborationService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.handler.annotation.DestinationVariable;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.stereotype.Controller;
//
//@Controller
//public class EditorController {
//
//    @Autowired
//    private CollaborationService collaborationService;
//
//    @MessageMapping("/editor/{roomId}/operation")
//    @SendTo("/topic/editor/{roomId}")
//    public OperationDto handleOperation(
//            @DestinationVariable String roomId,
//            OperationDto operation) {
//        collaborationService.applyOperation(roomId, operation);
//        return operation;
//    }
//}