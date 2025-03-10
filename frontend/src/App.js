// App.js - Componente principal da aplicação
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import Welcome from './pages/Welcome';
import CourseSelection from './pages/CourseSelection';
import PersonalInfo from './pages/PersonalInfo';
import FamilyInfo from './pages/FamilyInfo';
import AdditionalInfo from './pages/AdditionalInfo';
import Confirmation from './pages/Confirmation';
import Success from './pages/Success';
import NotFound from './pages/NotFound';
import './styles/index.css';

function App() {
  return (
    <Router>
      <FormProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/course-selection" element={<CourseSelection />} />
            <Route path="/personal-info" element={<PersonalInfo />} />
            <Route path="/family-info" element={<FamilyInfo />} />
            <Route path="/additional-info" element={<AdditionalInfo />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/success" element={<Success />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </FormProvider>
    </Router>
  );
}

export default App;