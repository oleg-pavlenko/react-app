import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Container from './Container';

function Page(props) {
  const { children, wide, title } = props;
  useEffect(() => {
    document.title = `${props.title} | ComplexApp`;
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <Container wide={wide}>
      {children}
    </Container>
  );
}

Page.defaultProps = {
  wide: false,
  title: '',
};

Page.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  wide: PropTypes.bool,
};

export default Page;
