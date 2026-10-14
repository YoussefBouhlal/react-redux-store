import './App.css';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';

import Header from './containers/Header';
import ProductListing from './containers/ProductListing';
import ProductDetails from './containers/ProductDetail';

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<ProductListing />} />
					<Route path="/product/:productId" element={<ProductDetails />} />
					<Route path="*" element={
						<div className="ui container">
							<h1>Page not found</h1>
							<p>The page you requested does not exist.</p>
							<Link to="/">Back to products</Link>
						</div>
					} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
