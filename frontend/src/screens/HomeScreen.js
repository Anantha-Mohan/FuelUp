import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button, Container } from "react-bootstrap";
import Product from "../components/Product";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Paginate from "../components/Paginate";
import ProductCarousel from "../components/ProductCarousel";
import { listProducts } from "../actions/productActions";

function HomeScreen({ history }) {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { error, loading, products, page, pages } = productList;

  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showHomePage, setShowHomePage] = useState(false);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const city = await fetchCityByCoordinates(latitude, longitude);
          setUserLocation(city);
          setShowSubmitButton(false);
          setShowLocationForm(true);
          setShowHomePage(true);
        },
        (error) => {
          console.error(error);
          // Handle error
        }
      );
    } else {
      // Geolocation is not supported by the browser
      // Handle unsupported geolocation
    }
  };

  const fetchCityByCoordinates = async (latitude, longitude) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    const city =
      data.address.city || data.address.town || data.address.village || null;
    return city;
  };

  let keyword = history.location.search;

  useEffect(() => {
    dispatch(listProducts(keyword));
  }, [dispatch, keyword]);

  return (
    <div className="custom-background">
      {showSubmitButton && (
        <Container className="text-center py-5">
          <h3 className="mb-4">
            Click the button to display gas stations near you
          </h3>
          <Button
            type="button"
            onClick={handleLocationClick}
            variant="outline-primary"
            size="lg"
          >
            Grab Location
          </Button>
        </Container>
      )}

      {showLocationForm && (
        <Container className="text-center py-5">
          <h4 className="mb-4">
            Your Location: <strong>{userLocation}</strong>
          </h4>
          <h2 className="mb-5">
            Here are the petrol products available near your location
          </h2>
        </Container>
      )}

      {showHomePage && (
        <Container className="py-5">
          {!keyword && <ProductCarousel />}
          <h1 className="mb-4">Latest Products</h1>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <div>
              <Row>
                {products.map((product) => (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                    <Product product={product} />
                  </Col>
                ))}
              </Row>
              <Paginate page={page} pages={pages} keyword={keyword} />
            </div>
          )}
          {showLocationForm && (
            <Button
              type="submit"
              variant="outline-success"
              className="p-2 mt-4"
              onClick={() =>
                (window.location.href = "https://forms.gle/5R944c8iZYAhYpbU9")
              }
              style={{
                float: "right",
              }}
            >
              Join As Seller
            </Button>
          )}
        </Container>
      )}
    </div>
  );
}

export default HomeScreen;
