package com.kpop.Clz.controller;

import com.kpop.Clz.model.Group;
import com.kpop.Clz.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

    private final GroupService groupService;

    @Autowired
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // GET http://localhost:8080/api/groups
    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        List<Group> groups = groupService.getAllGroups();
        return ResponseEntity.ok(groups);
    }

    // GET http://localhost:8080/api/groups/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Integer id) {
        Optional<Group> groupOptional = groupService.getGroupById(id);
        return groupOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST http://localhost:8080/api/groups
    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        // Validate group data if necessary
        Group savedGroup = groupService.saveGroup(group);
        return new ResponseEntity<>(savedGroup, HttpStatus.CREATED);
    }

    // PUT http://localhost:8080/api/groups/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable Integer id, @RequestBody Group groupDetails) {
        Optional<Group> updatedGroupOptional = groupService.updateGroup(id, groupDetails);
        return updatedGroupOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE http://localhost:8080/api/groups/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Integer id) {
        if (groupService.getGroupById(id).isPresent()) {
            groupService.deleteGroup(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}