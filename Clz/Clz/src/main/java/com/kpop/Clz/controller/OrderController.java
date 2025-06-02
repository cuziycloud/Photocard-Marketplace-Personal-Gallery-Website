package com.kpop.Clz.controller;

import com.kpop.Clz.dto.OrderDTO;
import com.kpop.Clz.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getCurrentUserOrders() {
        System.out.println("OrderController: Received request for /my-orders");
        try {
            List<OrderDTO> orders = orderService.getOrdersForCurrentUser();
            if (orders == null || orders.isEmpty()) {
                System.out.println("OrderController: No orders found, returning 204 No Content.");
                return ResponseEntity.noContent().build();
            }
            System.out.println("OrderController: Found " + orders.size() + " orders, returning 200 OK.");
            return ResponseEntity.ok(orders);
        } catch (UsernameNotFoundException e) {
            System.err.println("OrderController: User not found - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            System.err.println("OrderController: Generic error fetching orders - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}