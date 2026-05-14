package com.ah.web.dto.response;

import com.ah.web.entity.Address;

public class AddressResponse {
    private Long id;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String pincode;
    private String addressType;
    private Boolean isDefault;

    public AddressResponse() {}

    public AddressResponse(Long id, String addressLine1, String addressLine2, String city, String state,
                           String firstName, String lastName, String phone, String email, String pincode,
                           String addressType, Boolean isDefault) {
        this.id = id;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.pincode = pincode;
        this.addressType = addressType;
        this.isDefault = isDefault;
    }

    public static AddressResponse fromEntity(Address address) {
        if (address == null) return null;
        return new AddressResponse(
                address.getId(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getFirstName(),
                address.getLastName(),
                address.getPhone(),
                address.getEmail(),
                address.getPincode(),
                address.getAddressType(),
                address.getIsDefault()
        );
    }

    // Getters
    public Long getId() { return id; }
    public String getAddressLine1() { return addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getPincode() { return pincode; }
    public String getAddressType() { return addressType; }
    public Boolean getIsDefault() { return isDefault; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public void setCity(String city) { this.city = city; }
    public void setState(String state) { this.state = state; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setEmail(String email) { this.email = email; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public void setAddressType(String addressType) { this.addressType = addressType; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
}
