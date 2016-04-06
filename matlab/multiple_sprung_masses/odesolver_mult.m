% Title: Ordinary differential equation solver for 2 bogies
% Date: February 12, 2016
% Description: defines all functions for master script
% Last modified: March 7, 2016

function fvalue = odesolver_mult(t1,x,n,L_bogie1,L_bogie2,m_vehicle,v,m_bridge,L,g,Omega_bridge,Omega_bogie1,Omega_bogie2)
% Set of ordinary differential equations
%   f1 = x2
%   f2 = -(A1+A4+A7)*x1+A3*x3+A6*x5-A2-A5
%   f3 = x4
%   f4 = B2*x1-B1*x3
%	f5 = x6
%	f6 = C2*x1-C1*x5

L1		= v*t1-L_bogie1;						% current position of bogie 1 [m]
L2		= v*t1-L_bogie2;						% current position of bogie 2 [m]

H1		= heaviside(L-L1)-1+heaviside(L1);		% heaviside functions Theta(L1)
H2		= heaviside(L-L2)-1+heaviside(L2);		% heaviside functions Theta(L2)

% Define constants
A1		= Omega_bridge^2;
A2 		= (2*m_vehicle*g)/(m_bridge*L)*H1*sin(n*pi*L1/L);
A3		= (2*Omega_bogie1^2*m_vehicle)/(m_bridge*L)*H1*sin(n*pi*L1/L);
A4		= (2*Omega_bogie1^2*m_vehicle)/(m_bridge*L)*H1*((sin(n*pi*L2/L))^2);
A5 		= (2*m_vehicle*g)/(m_bridge*L)*H2*(sin(n*pi*L2/L));
A6 		= (2*Omega_bogie2^2*m_vehicle)/(m_bridge*L)*H2*(sin(n*pi*L2/L));
A7 		= (2*Omega_bogie2^2*m_vehicle)/(m_bridge*L)*H2*((sin(n*pi*L2/L))^2);
B1		= Omega_bogie1^2;
B2		= Omega_bogie1^2*H1*sin(n*pi*L1/L); %include H1?
C1 		= Omega_bogie2^2;
C2 		= Omega_bogie2^2*H2*sin(n*pi*L2/L); %include H2?

%
% system of first order ordinary differential equations
fvalue = zeros(6,1);
fvalue(1) = x(2);
fvalue(2) = -(A1+A4+A7)*x(1)+(A3)*x(3)+A6*x(5)-A2-A5;
fvalue(3) = x(4);
fvalue(4) = (B2)*x(1)-(B1)*x(3);
fvalue(5) = x(6);
fvalue(6) = (C2)*x(1)-(C1)*x(5);
end