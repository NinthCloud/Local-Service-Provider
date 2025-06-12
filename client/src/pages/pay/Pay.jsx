import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

const stripePromise = loadStripe(
  "your public key"
);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { bookingId } = useParams();

  // Debug logs
  console.log("Pay component - bookingId from params:", bookingId);
  console.log("Pay component - current URL:", window.location.href);
  console.log("Pay component - all params:", useParams());

  useEffect(() => {
    const makeRequest = async () => {
      // Check if bookingId exists
      if (!bookingId) {
        setError("Booking ID is missing from URL");
        setLoading(false);
        return;
      }

      try {
        console.log("Making payment intent request for bookingId:", bookingId);
        
        const res = await newRequest.post(
          `/bookings/create-payment-intent/${bookingId}`
        );
        
        console.log("Payment intent response:", res.data);
        setClientSecret(res.data.clientSecret);
        setLoading(false);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError(err.response?.data?.message || "Failed to create payment intent");
        setLoading(false);
      }
    };
    makeRequest();
  }, [bookingId]);

  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return <div className="pay">Loading payment...</div>;
  }

  if (error) {
    return (
      <div className="pay">
        <div className="error" style={{ color: 'red', padding: '20px' }}>
          <h3>Payment Error</h3>
          <p>{error}</p>
          <p>BookingId: {bookingId || 'undefined'}</p>
          <p>Current URL: {window.location.href}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pay">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default Pay;