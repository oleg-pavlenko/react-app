import React from 'react';
import PropTypes from 'prop-types';

function FlashMessages(props) {
  const { messages } = props;
  return (
    <div className="floating-alerts">
      {messages.map((msg, index) => (
        <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
          {msg}
        </div>
      ))}
    </div>
  );
}

FlashMessages.propTypes = {
  messages: PropTypes.array.isRequired,
};

export default FlashMessages;
