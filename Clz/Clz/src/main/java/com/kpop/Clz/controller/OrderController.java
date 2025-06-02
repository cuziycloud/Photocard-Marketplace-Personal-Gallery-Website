package com.kpop.Clz.controller;

import com.kpop.Clz.dto.OrderDTO;
import com.kpop.Clz.exception.InsufficientStockException;
import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.service.OrderService;
import com.kpop.Clz.dto.CreateOrderRequestDTO;
import com.kpop.Clz.model.Order;
import com.kpop.Clz.model.User;
import com.kpop.Clz.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderService orderService;
    @Autowired private UserService userService;

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

    @PostMapping("/create")
    public ResponseEntity<?> createNewOrder(
            @Valid @RequestBody CreateOrderRequestDTO createOrderRequest,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User springSecurityUser) {

        System.out.println("OrderController: Received request to /api/orders/create");
        if (springSecurityUser == null) {
            System.err.println("OrderController: User not authenticated for creating order.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }
        try {
            User currentUser = userService.getUserByUsernameOrEmail(springSecurityUser.getUsername()) // Đảm bảo UserService có hàm này
                    .orElseThrow(() -> new RuntimeException("Authenticated user (email/username: " + springSecurityUser.getUsername() + ") not found in database"));

            System.out.println("OrderController: Authenticated user for order creation: " + currentUser.getEmail());

            Order createdOrderEntity = orderService.createOrder(createOrderRequest, currentUser);

            // Convert entity Order sang OrderDTO để trả về cho client
            OrderDTO orderResponse = orderService.convertToOrderDTO(createdOrderEntity);

            System.out.println("OrderController: Order created successfully, ID: " + orderResponse.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(orderResponse);

        } catch (IllegalArgumentException | InsufficientStockException e) { // Bắt các lỗi nghiệp vụ cụ thể
            System.err.println("OrderController: Business logic error creating order - " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            System.err.println("OrderController: Resource not found error creating order - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (RuntimeException e) { // Bắt các lỗi Runtime không mong muốn khác
            System.err.println("OrderController: Runtime error creating order - " + e.getMessage());
            e.printStackTrace(); // In stack trace để debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the order: " + e.getMessage());
        }
    }
}