// components/CompanyInfo.js
import Image from 'next/image';

const CompanyInfo = () => (
  <div className="company_info">
    <div className="container">
      <div className="row">
        <div className="col-xl-5 col-md-5">
          <div className="man_thumb">
            <Image 
              src="/img/ilstrator/man.png" 
              alt="Team illustration" 
              width={500} 
              height={500} 
            />
          </div>
        </div>
        <div className="col-xl-7 col-md-7">
          <div className="company_info_text">
            <h3>
              Empowering teams to collaborate, track time, <br />
              and manage tasks effortlessly.
            </h3>
            <p>
              Our platform provides a comprehensive solution for managing users, workspaces, and projects. 
              With powerful task management, real-time collaboration, and automated time tracking, 
              teams can focus on what truly matters—delivering results.
            </p>
            <a href="#" className="boxed-btn3">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CompanyInfo;
