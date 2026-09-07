package com.ah.web;
import com.ah.web.entity.*;
import com.ah.web.dto.request.*;
import com.ah.web.repository.*;
import com.ah.web.service.*;
import com.ah.web.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CommerceIntegrationTest {
 @MockitoBean RagChatService chat;
 @MockitoBean ProductEmbeddingService embeddings;
 @MockitoBean PaymentGateway gateway;
 @MockitoBean JavaMailSender mail;
 @Autowired UserRepository users;
 @Autowired ProductRepository products;
 @Autowired CartRepository carts;
 @Autowired AddressRepository addresses;
 @Autowired OrderRepository orders;
 @Autowired OrderService orderService;
 @Autowired PaymentService payments;
 @Autowired CustomerFeaturesService features;
 @Autowired PasswordResetService resets;
 @Autowired PasswordEncoder encoder;
 @Autowired JdbcTemplate db;
 @Autowired EntityManager em;
 User user,other;Product product;Address address;
 @BeforeEach void setup(){
  user=users.save(User.builder().email(UUID.randomUUID()+"@example.com").password(encoder.encode("old-password")).firstName("Test").lastName("Customer").build());
  other=users.save(User.builder().email(UUID.randomUUID()+"@example.com").password("unused").firstName("Other").lastName("Customer").build());
  product=new Product();product.setName("Almonds");product.setPrice(new BigDecimal("500"));product.setStock(10);product.setSku(UUID.randomUUID().toString());product=products.save(product);
  address=new Address();address.setUser(user);address.setEmail(user.getEmail());address.setFirstName("Test");address.setLastName("Customer");address.setAddressLine1("1 Test Road");address.setCity("Vijayawada");address.setState("AP");address.setPincode("520001");address.setPhone("9876543210");address=addresses.save(address);
  Cart cart=Cart.builder().user(user).build();CartItem item=CartItem.builder().product(product).quantity(1).build();cart.addItem(item);carts.saveAndFlush(cart);
  when(gateway.createOrder(any(),any())).thenReturn("order_test");when(gateway.keyId()).thenReturn("rzp_test");when(gateway.verifySignature(any(),any(),eq(false))).thenReturn(true);
 }
 CreateOrderRequest cod(){return new CreateOrderRequest(address.getId(),"COD",null);}
 VerifyPaymentRequest verification(){var r=new VerifyPaymentRequest();r.setRazorpayOrderId("order_test");r.setRazorpayPaymentId("pay_test");r.setRazorpaySignature("signature");return r;}
 Long start(){return ((Number)payments.start(user.getId(),new PaymentService.StartRequest(address.getId(),null,null,new BigDecimal("549"))).get("orderId")).longValue();}
 @Test void codPersistsFeesAndCancellationRestoresStockOnce(){
  var result=orderService.createOrder(user.getId(),cod());assertEquals(new BigDecimal("578.00"),result.getTotalAmount());assertEquals(new BigDecimal("29"),result.getCodCharges());
  orderService.cancelOrder(user.getId(),result.getId());orderService.cancelOrder(user.getId(),result.getId());em.flush();em.clear();
  assertEquals(10,products.findById(product.getId()).orElseThrow().getStock());
 }
 @Test void ordinaryOrderCannotClaimPayment(){var request=cod();request.setRazorpayPaymentId("pay_fake");assertThrows(BadRequestException.class,()->orderService.createOrder(user.getId(),request));}
 @Test void staleQuoteRollsBackCheckout(){var request=cod();request.setExpectedTotal(BigDecimal.ONE);assertThrows(BadRequestException.class,()->orderService.createOrder(user.getId(),request));}
 @Test void paidOrderIsBoundToServerAmountAndIdempotent(){
  Long id=start();when(gateway.fetchPayment("pay_test")).thenReturn(new PaymentGateway.Payment("pay_test","order_test",54900,"INR","captured"));
  var result=payments.verify(user.getId(),verification());assertEquals(id,result.getId());assertEquals("PAID",result.getPaymentStatus());
  assertEquals(id,payments.verify(user.getId(),verification()).getId());assertEquals(1,orders.countByUserId(user.getId()));
 }
 @Test void insufficientPaymentIsRejected(){start();when(gateway.fetchPayment("pay_test")).thenReturn(new PaymentGateway.Payment("pay_test","order_test",1,"INR","captured"));assertThrows(BadRequestException.class,()->payments.verify(user.getId(),verification()));}
 @Test void uncapturedPaymentIsRejected(){start();when(gateway.fetchPayment("pay_test")).thenReturn(new PaymentGateway.Payment("pay_test","order_test",54900,"INR","authorized"));assertThrows(BadRequestException.class,()->payments.verify(user.getId(),verification()));}
 @Test void expiredOnlineCheckoutReleasesInventoryAndCouponReservation(){
  Long id=start();db.update("UPDATE orders SET created_at=? WHERE id=?",java.sql.Timestamp.valueOf(java.time.LocalDateTime.now().minusMinutes(31)),id);em.clear();
  orderService.expireAbandonedOnlineCheckouts();em.flush();em.clear();
  Order expired=orders.findById(id).orElseThrow();assertEquals(OrderStatus.CANCELLED,expired.getStatus());assertEquals("EXPIRED",expired.getPaymentStatus());
  assertEquals(10,products.findById(product.getId()).orElseThrow().getStock());
 }
 @Test void paymentOwnerAndSignatureAreChecked(){Long id=start();assertThrows(BadRequestException.class,()->payments.start(other.getId(),new PaymentService.StartRequest(null,null,id,null)));assertThrows(BadRequestException.class,()->payments.verify(other.getId(),verification()));when(gateway.verifySignature(any(),any(),eq(false))).thenReturn(false);assertThrows(BadRequestException.class,()->payments.verify(user.getId(),verification()));}
 @Test void cancelPaidOrderRecordsPendingRefundAndRestoresStock(){Long id=start();when(gateway.fetchPayment("pay_test")).thenReturn(new PaymentGateway.Payment("pay_test","order_test",54900,"INR","captured"));payments.verify(user.getId(),verification());when(gateway.refund("pay_test",id,new BigDecimal("549.00"))).thenReturn("REFUND_PENDING");var result=orderService.cancelOrder(user.getId(),id);assertEquals(OrderStatus.CANCELLED,result.getStatus());assertEquals("REFUND_PENDING",result.getPaymentStatus());em.flush();em.clear();assertEquals(10,products.findById(product.getId()).orElseThrow().getStock());}
 @Test void returnIsPersistedAndOwned(){var result=orderService.createOrder(user.getId(),cod());Order order=orders.findById(result.getId()).orElseThrow();order.setStatus(OrderStatus.DELIVERED);orders.save(order);var returned=orderService.requestReturn(user.getId(),order.getId(),"Package damaged");assertNotNull(returned.getReturnRequestedAt());assertEquals("Package damaged",returned.getReturnReason());assertThrows(BadRequestException.class,()->orderService.requestReturn(other.getId(),order.getId(),"Other account"));}
 @Test void wishlistIsAccountScopedAndDeduplicated(){features.add(user.getId(),product.getId());features.add(user.getId(),product.getId());assertEquals(1,features.wishlist(user.getId()).size());assertTrue(features.wishlist(other.getId()).isEmpty());features.remove(other.getId(),product.getId());assertEquals(1,features.wishlist(user.getId()).size());features.remove(user.getId(),product.getId());assertTrue(features.wishlist(user.getId()).isEmpty());}
 @Test void newsletterStoresConsentRequestOnce(){features.subscribe("Reader@Example.com");features.subscribe("reader@example.com");assertEquals(1,db.queryForObject("SELECT COUNT(*) FROM newsletter_subscriptions WHERE email='reader@example.com'",Integer.class));}
 @Test void resetLinkIsHashedSingleUseAndRevokesSessions(){
  resets.request(user.getEmail());var captor=org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);verify(mail).send(captor.capture());String body=captor.getValue().getText();String token=body.substring(body.indexOf("#token=")+7).split("\\n")[0];
  assertNotEquals(token,db.queryForObject("SELECT token_hash FROM password_reset_tokens WHERE user_id=?",String.class,user.getId()));
  resets.reset(token,"new-password-123");assertTrue(encoder.matches("new-password-123",users.findById(user.getId()).orElseThrow().getPassword()));assertEquals(1,user.getAuthVersion());
  assertThrows(BadRequestException.class,()->resets.reset(token,"another-password"));
 }
}
