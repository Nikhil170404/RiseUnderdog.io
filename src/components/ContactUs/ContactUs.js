import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaCommentDots, FaSpinner } from 'react-icons/fa';
import './ContactUs.css';

const ContactUs = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("");
    setLoading(true);

    const formData = new FormData(event.target);
    formData.append("access_key", "4192796f-04c0-4a01-bdb7-04a93d80989e");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully");
        event.target.reset();
      } else {
        setResult("Submission Failed: " + data.message);
      }
    } catch (error) {
      setResult("Submission Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contactus-container">
      <h1><FaCommentDots /> Contact Us</h1>
      <p>We'd love to hear from you! Whether you have questions, feedback, or need support, feel free to reach out to us.</p>
      <form className="contact-form" onSubmit={onSubmit}>
        <label htmlFor="name"><FaUser /> Name</label>
        <input type="text" id="name" name="name" placeholder="Your Name" required />
        
        <label htmlFor="email"><FaEnvelope /> Email</label>
        <input type="email" id="email" name="email" placeholder="Your Email" required />
        
        <label htmlFor="message"><FaCommentDots /> Message</label>
        <textarea id="message" name="message" placeholder="Your Message" required></textarea>
        
        <button type="submit" disabled={loading}>
          {loading ? <FaSpinner className="spinner" /> : 'Submit'}
        </button>
      </form>
      <span className={`result-message ${result.includes("Failed") ? 'error' : 'success'}`}>
        {result}
      </span>
    </div>
  );
};

export default ContactUs;
