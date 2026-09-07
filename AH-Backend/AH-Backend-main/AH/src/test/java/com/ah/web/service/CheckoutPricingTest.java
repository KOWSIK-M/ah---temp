package com.ah.web.service;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
class CheckoutPricingTest {
 @Test void thresholdDiscountAndCodAreConsistent(){
  var q=CheckoutPricing.calculate(new BigDecimal("999"),new BigDecimal("99"),"COD");
  assertEquals(new BigDecimal("978.00"),q.totalAmount());
  assertEquals(new BigDecimal("49"),q.shippingCharges());
  assertEquals(new BigDecimal("29"),q.codCharges());
  assertEquals(new BigDecimal("900.00"),CheckoutPricing.calculate(new BigDecimal("1000"),new BigDecimal("100"),"RAZORPAY").totalAmount());
 }
 @Test void invalidDiscountCannotCreateNegativeTotal(){assertThrows(IllegalArgumentException.class,()->CheckoutPricing.calculate(BigDecimal.ONE,BigDecimal.TEN,"COD"));}
}
