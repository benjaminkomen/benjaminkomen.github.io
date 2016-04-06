% Title:			Ordinary differential equation solver
% Date:				February 12, 2016
% Last modified:	March 31, 2016
% Description:		defines all functions for master script

function fvalue = odesolver(t1,x,n,m_vehicle,v,m_bridge,L,g,Omega_bridge,Omega_vehicle)
% Set of ordinary differential equations
%   f1 = x2
%   f2 = -A1*x1+A2*x3-A3
%   f3 = x4
%   f4 = B1*x1-B2*x3

L1		= v*t1;									% current position of vehicle [m]
H1		= heaviside(L-L1)-1+heaviside(L1);		% heaviside functions Theta(L1)

% Define constants
A1		= (2*Omega_vehicle^2*m_vehicle)/(m_bridge*L)*H1*((sin(n*pi*L1/L))^2)+Omega_bridge^2;
A2		= (2*Omega_vehicle^2*m_vehicle)/(m_bridge*L)*H1*sin(n*pi*L1/L);
A3		= (2*m_vehicle*g)/(m_bridge*L)*H1*sin(n*pi*L1/L);
B1		= Omega_vehicle^2*sin(n*pi*L1/L);
B2		= Omega_vehicle^2;

%
% system of first order ordinary differential equations
fvalue = zeros(4,1);
fvalue(1) = x(2);
fvalue(2) = -(A1)*x(1)+(A2)*x(3)-(A3);
fvalue(3) = x(4);
fvalue(4) = (B1)*x(1)-(B2)*x(3);
end