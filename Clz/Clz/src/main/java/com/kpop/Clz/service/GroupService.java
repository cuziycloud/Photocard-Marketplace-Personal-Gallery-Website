package com.kpop.Clz.service;

import com.kpop.Clz.model.Group;
import com.kpop.Clz.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {

    private final GroupRepository groupRepository;

    @Autowired
    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public Optional<Group> getGroupById(Integer id) {
        return groupRepository.findById(id);
    }

    public Group saveGroup(Group group) {
        return groupRepository.save(group);
    }

    public void deleteGroup(Integer id) {
        groupRepository.deleteById(id);
    }

    public Optional<Group> updateGroup(Integer id, Group groupDetails) {
        return groupRepository.findById(id)
                .map(existingGroup -> {
                    existingGroup.setName(groupDetails.getName());
                    existingGroup.setLogoImageUrl(groupDetails.getLogoImageUrl());
                    return groupRepository.save(existingGroup);
                });
    }
}