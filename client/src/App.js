import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// ================= HOME =================
import Home from './component/Home/Home';

// ================= COMMON PAGES =================
import About from './component/About/About';
import Contact from './component/Contact/Contact';
import Gallery from './component/Gallery/Gallery';

// ================= LOGIN =================
import PatientLogin from './component/Login/PatientLogin';
import DoctorLogin from './component/Login/DoctorLogin';
import EmployeeLogin from './component/Login/EmployeeLogin';
import AdministratorLogin from './component/Login/AdministratorLogin';

// ================= PATIENT =================
import PatientReg from './component/PatientReg/PatientReg';
import PatientHome from './component/Patient/PatientHome';
import PatHome from './component/Patient/PatHome';

// ================= DOCTOR =================
import DocHome from './component/Doctor/DocHome';
import Doctor from './component/Doctor/Doctor';
import Billing from './component/Doctor/billing';

// ================= EMPLOYEE =================
import EmpHome from './component/Employee/EmpHome';
import Employee from './component/Employee/Employee';

// ================= ADMIN =================
import AdHome from './component/Admin/AdHome';

// ================= ADMIN MANAGEMENT =================
import Admins from './component/managing/admins';
import Doctors from './component/managing/doctors';
import EmployeeManagement from './component/managing/employee';
import Staff from './component/managing/staff';
import Bill from './component/managing/bill';

// ================= NEW ADMIN MANAGEMENT =================
import Appointments from './component/managing/appointments';
import Inpatients from './component/managing/inpatients';
import Beds from './component/managing/beds';


function App() {
  return (
    <Router>
      <Switch>

        {/* ================= HOME ================= */}

        <Route
          exact
          path="/"
          component={Home}
        />


        {/* ================= COMMON ================= */}

        <Route
          exact
          path="/about"
          component={About}
        />

        <Route
          exact
          path="/gallery"
          component={Gallery}
        />

        <Route
          exact
          path="/contact"
          component={Contact}
        />


        {/* ================= PATIENT ================= */}

        <Route
          exact
          path="/regPatient"
          component={PatientReg}
        />

        <Route
          exact
          path="/patient/login"
          component={PatientLogin}
        />

        <Route
          exact
          path="/patient/login/home"
          component={PatHome}
        />

        <Route
          exact
          path="/patient/login/patient_home"
          component={PatientHome}
        />


        {/* ================= DOCTOR ================= */}

        <Route
          exact
          path="/doctors/login"
          component={DoctorLogin}
        />

        <Route
          exact
          path="/doctors/login/home"
          component={DocHome}
        />

        <Route
          exact
          path="/doctors/login/doctor_home"
          component={Doctor}
        />

        {/* Doctor Billing */}

        <Route
          exact
          path="/doctors/login/billing/:patient_id"
          component={Billing}
        />


        {/* ================= EMPLOYEE ================= */}

        <Route
          exact
          path="/employee/login"
          component={EmployeeLogin}
        />

        <Route
          exact
          path="/employee/login/home"
          component={EmpHome}
        />

        <Route
          exact
          path="/employee/login/employee_home"
          component={Employee}
        />


        {/* ================= ADMINISTRATOR LOGIN ================= */}

        <Route
          exact
          path="/administrator/login"
          component={AdministratorLogin}
        />


        {/* ================= ADMIN HOME ================= */}

        <Route
          exact
          path="/administrator/login/home"
          component={AdHome}
        />


        {/* ================= ADMIN DASHBOARD ================= */}

        <Route
          exact
          path="/administrator/login/admin_home"
          component={Admins}
        />


        {/* ================= DOCTOR MANAGEMENT ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/doctors"
          component={Doctors}
        />


        {/* ================= EMPLOYEE MANAGEMENT ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/employee"
          component={EmployeeManagement}
        />


        {/* ================= STAFF MANAGEMENT ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/staff"
          component={Staff}
        />


        {/* ================= BILLING ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/billing"
          component={Bill}
        />


        {/* ================= APPOINTMENT MANAGEMENT ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/appointments"
          component={Appointments}
        />


        {/* ================= INPATIENT MANAGEMENT ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/inpatients"
          component={Inpatients}
        />


        {/* ================= BED MANAGEMENT ================= */}

        <Route
          exact
          path="/administrator/login/admin_home/beds"
          component={Beds}
        />

      </Switch>
    </Router>
  );
}

export default App;