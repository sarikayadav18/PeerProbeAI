//package com.PeerProbeAI.server.service.impl;
//
//import com.PeerProbeAI.server.exception.RoomNotFoundException;
//import com.PeerProbeAI.server.model.*;
//import com.PeerProbeAI.server.repository.*;
//import com.PeerProbeAI.server.service.RoomService;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class RoomServiceImpl implements RoomService {
//
//    private final RoomRepository roomRepository;
//    private final UserRepository userRepository;
//    private final ChatMessageRepository chatMessageRepository;
//    private final DocumentService documentService;
//
//    public RoomServiceImpl(RoomRepository roomRepository,
//                           UserRepository userRepository,
//                           ChatMessageRepository chatMessageRepository,
//                           DocumentService documentService) {
//        this.roomRepository = roomRepository;
//        this.userRepository = userRepository;
//        this.chatMessageRepository = chatMessageRepository;
//        this.documentService = documentService;
//    }
//
//    @Override
//    @Transactional
//    public Room createRoom(String name, Long ownerId) {
//        User owner = userRepository.findById(ownerId)
//                .orElseThrow(() -> new RuntimeException("User not found: " + ownerId));
//
//        String uniqueCode = generateUniqueRoomCode();
//        Room room = new Room(name, uniqueCode, owner);
//        room = roomRepository.save(room);
//
//        // Create empty document for the room
//        documentService.createDocumentForRoom(room.getId(), "");
//
//        return room;
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public Room getRoomById(Long roomId) {
//        return roomRepository.findById(roomId)
//                .orElseThrow(() -> new RoomNotFoundException(roomId));
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public Room getRoomByCode(String code) {
//        return roomRepository.findByCode(code)
//                .orElseThrow(() -> new RuntimeException("Room not found with code: " + code));
//    }
//
//    @Override
//    @Transactional
//    public void addParticipant(Long roomId, Long userId) {
//        Room room = roomRepository.findById(roomId)
//                .orElseThrow(() -> new RoomNotFoundException(roomId));
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
//
//        room.addParticipant(user);
//        roomRepository.save(room);
//    }
//
//    @Override
//    @Transactional
//    public ChatMessage saveChatMessage(Long roomId, Long senderId, String content) {
//        Room room = roomRepository.findById(roomId)
//                .orElseThrow(() -> new RoomNotFoundException(roomId));
//        User sender = userRepository.findById(senderId)
//                .orElseThrow(() -> new RuntimeException("User not found: " + senderId));
//
//        ChatMessage message = new ChatMessage(content, sender, room);
//        return chatMessageRepository.save(message);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<ChatMessage> getChatHistory(Long roomId) {
//        return chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
//    }
//
//    private String generateUniqueRoomCode() {
//        String code;
//        do {
//            code = UUID.randomUUID().toString().substring(0, 8);
//        } while (roomRepository.existsByCode(code));
//        return code;
//    }
//}