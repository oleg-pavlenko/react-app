import React from 'react';
import PropTypes from 'prop-types';

function Container(props) {
  const { children, wide } = props;
  return (
    <div className={`container py-md-5 ${wide ? '' : 'container--narrow'}`}>
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  wide: PropTypes.bool.isRequired,
};

export default Container;
