package com.ah.web.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    @Column(nullable = false)
    private String city;

    @NotBlank
    @Column(nullable = false)
    private String state;

    @NotBlank
    @Column(nullable = false)
    private String firstName;

    @NotBlank
    @Column(nullable = false)
    private String lastName;

    @NotBlank
    @Column(nullable = false)
    private String phone;

    @NotBlank
    @Column(nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String pincode;

    private String addressType;

    private Boolean isDefault = false;

    // Default constructor
    public Address() {}

    // All-args constructor
    public Address(Long id, User user, String addressLine1, String addressLine2, String city, String state,
                   String firstName, String lastName, String phone, String email, String pincode,
                   String addressType, Boolean isDefault) {
        this.id = id;
        this.user = user;
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

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
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
    public void setUser(User user) { this.user = user; }
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

    // Helper methods
    public String getFullName() { return firstName + " " + lastName; }
    public String getZipCode() { return pincode; }
    public String getMobile() { return phone; }

    // Builder
    public static AddressBuilder builder() { return new AddressBuilder(); }

    public static class AddressBuilder {
        private Long id;
        private User user;
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
        private Boolean isDefault = false;

        public AddressBuilder id(Long id) { this.id = id; return this; }
        public AddressBuilder user(User user) { this.user = user; return this; }
        public AddressBuilder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public AddressBuilder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public AddressBuilder city(String city) { this.city = city; return this; }
        public AddressBuilder state(String state) { this.state = state; return this; }
        public AddressBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AddressBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public AddressBuilder phone(String phone) { this.phone = phone; return this; }
        public AddressBuilder email(String email) { this.email = email; return this; }
        public AddressBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public AddressBuilder addressType(String addressType) { this.addressType = addressType; return this; }
        public AddressBuilder isDefault(Boolean isDefault) { this.isDefault = isDefault; return this; }

        public Address build() {
            return new Address(id, user, addressLine1, addressLine2, city, state, firstName, lastName,
                    phone, email, pincode, addressType, isDefault);
        }
    }
}
