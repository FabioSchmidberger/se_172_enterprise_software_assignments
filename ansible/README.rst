======
Ansile
======

How To Run
==========

Run the deployment playbook:

.. code::

    sudo ansible-playbook -i hosts.conf hello-world-webserver-deploy.yml -b

Run the teardown playbook:

.. code::

    sudo ansible-playbook -i hosts.conf hello-world-webserver-teardown.yml -b

Todo
====

- sudo privledge for playbook
- Teardown Script: why is nginx not proberly uninstalled? even the config files are still present..