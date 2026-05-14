package com.ah.web.controller;

import com.ah.web.entity.Address;
import com.ah.web.entity.User;
import com.ah.web.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Address> createAddress(
            @AuthenticationPrincipal User user,
            @RequestBody Address address) {
        return ResponseEntity.ok(addressService.createAddress(user.getId(), address));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long addressId) {
        addressService.deleteAddress(user.getId(), addressId);
        return ResponseEntity.noContent().build();
    }
}
