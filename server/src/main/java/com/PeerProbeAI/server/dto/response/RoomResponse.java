//package com.PeerProbeAI.server.dto.response;
//
//import com.PeerProbeAI.server.model.Room;
//import lombok.Getter;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Getter
//public class RoomResponse {
//    private final Long id;
//    private final String name;
//    private final String code;
//    private final Long ownerId;
//    private final List<Long> participantIds;
//
//    public RoomResponse(Room room) {
//        this.id = room.getId();
//        this.name = room.getName();
//        this.code = room.getCode();
//        this.ownerId = room.getOwner().getId();
//        this.participantIds = room.getParticipants().stream()
//                .map(User::getId)
//                .collect(Collectors.toList());
//    }
//}