package com.ah.web.service;

import com.ah.web.entity.Address;
import com.ah.web.entity.User;
import com.ah.web.exception.ResourceNotFoundException;
import com.ah.web.repository.AddressRepository;
import com.ah.web.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address createAddress(Long userId, Address address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        address.setUser(user);
        
        if (address.getIsDefault()) {
            // Unset other default addresses
            List<Address> defaults = addressRepository.findByUserIdAndIsDefaultTrue(userId);
            for (Address def : defaults) {
                def.setIsDefault(false);
                addressRepository.save(def);
            }
        } else if (addressRepository.findByUserId(userId).isEmpty()) {
            // Set as default if first address
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this address");
        }

        addressRepository.delete(address);
    }
}
