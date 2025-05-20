package com.kpop.Clz.repository;

import com.kpop.Clz.model.Order;
import com.kpop.Clz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByUserAndStatus(User user, Order.OrderStatus status);

    Optional<Order> findByUserIdAndStatus(Integer userId, Order.OrderStatus status);
}