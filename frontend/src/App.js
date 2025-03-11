import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/index.css';
// Importe suas páginas existentes
import Welcome from './pages/Welcome';
import PersonalInfo from './pages/PersonalInfo';
import FamilyInfo from './pages/FamilyInfo';
import CourseSelection from './pages/CourseSelection';
import AdditionalInfo from './pages/AdditionalInfo';
import Confirmation from './pages/Confirmation';
import Success from './pages/Success';
import NotFound from './pages/NotFound';
// Importe as novas páginas
import Matricula from './pages/Matricula';
import ListaPresenca from './pages/ListaPresenca';

import { FormProvider } from './contexts/FormContext';

function App() {
  return (
    <Router>
      <FormProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/family-info" element={<FamilyInfo />} />
          <Route path="/course-selection" element={<CourseSelection />} />
          <Route path="/additional-info" element={<AdditionalInfo />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/success" element={<Success />} />
          {/* Novas rotas */}
          <Route path="/matricula" element={<Matricula />} />
          <Route path="/presenca/curso/:id" element={<ListaPresenca />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </FormProvider>
    </Router>
  );
}

export default App;