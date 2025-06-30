package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.dto.request.CreateRoomRequest;
import com.PeerProbeAI.server.dto.response.RoomResponse;
import com.PeerProbeAI.server.model.Room;
import com.PeerProbeAI.server.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        Room room = roomService.createRoom(request.getName(), userId);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Long roomId) {
        Room room = roomService.getRoomById(roomId);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<RoomResponse> getRoomByCode(@PathVariable String code) {
        Room room = roomService.getRoomByCode(code);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        roomService.addParticipant(roomId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/chat")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(@PathVariable Long roomId) {
        List<ChatMessage> messages = roomService.getChatHistory(roomId);
        List<ChatMessageResponse> response = messages.stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}