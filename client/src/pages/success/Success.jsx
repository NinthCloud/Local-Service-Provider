import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");
  const redirect_status = params.get("redirect_status");
  
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  useEffect(() => {
    const confirmPayment = async (attemptNumber = 1) => {
      try {
        console.log(`=== CONFIRMATION ATTEMPT ${attemptNumber} ===`);
        console.log("Payment Intent:", payment_intent);
        console.log("Redirect Status:", redirect_status);
        
        if (!payment_intent) {
          setError("No payment intent found in URL");
          setIsProcessing(false);
          return;
        }
        
        // Progressive delay: 2s, 4s, 6s for retries
        const delay = attemptNumber * 2000;
        console.log(`Waiting ${delay}ms before confirmation...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        const response = await newRequest.put("/bookings/confirm", { 
          payment_intent,
          attempt: attemptNumber
        });
        
        console.log("Confirmation successful:", response.data);
        setIsProcessing(false);
        
        // Redirect after success
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
        
      } catch (err) {
        console.error(`Attempt ${attemptNumber} failed:`, err);
        
        setAttempts(attemptNumber);
        
        if (attemptNumber < maxAttempts) {
          console.log(`Retrying... (${attemptNumber}/${maxAttempts})`);
          // Retry with exponential backoff
          setTimeout(() => {
            confirmPayment(attemptNumber + 1);
          }, 2000 * attemptNumber);
        } else {
          // All attempts failed
          console.log("All confirmation attempts failed");
          const errorMsg = err.response?.data || err.message || "Confirmation failed after multiple attempts";
          setError(errorMsg);
          setIsProcessing(false);
        }
      }
    };

    confirmPayment();
  }, [payment_intent, navigate]);

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Payment Confirmation Issue</h2>
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <p><strong>Don't worry!</strong> Your payment was likely successful, but there's a technical issue with confirmation.</p>
          <p><strong>What happened:</strong> {error}</p>
          <p><strong>Payment Intent:</strong> <code>{payment_intent}</code></p>
          <p><strong>Attempts made:</strong> {attempts}/{maxAttempts}</p>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p>Please try one of these options:</p>
        </div>
        
        <div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
              marginBottom: '10px'
            }}
          >
            Try Again
          </button>
          
          <button 
            onClick={() => navigate("/orders")}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
              marginBottom: '10px'
            }}
          >
            Check My Orders
          </button>
          
          <button 
            onClick={() => navigate("/contact")}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Confirming Your Payment...</h2>
      <div style={{ 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb',
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <p>✓ Payment processed successfully</p>
        <p>⏳ Confirming your booking...</p>
        {attempts > 0 && <p>🔄 Attempt {attempts}/{maxAttempts}</p>}
      </div>
      
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #28a745',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
      }}></div>
      
      <p style={{ marginTop: '20px', color: '#6c757d' }}>
        Please don't close this page...
      </p>
    </div>
  );
};

export default Success;