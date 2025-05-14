package com.kpop.Clz.repository;

import com.kpop.Clz.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {

}